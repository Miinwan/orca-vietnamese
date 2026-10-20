import SwiftUI
import Translation
import Foundation

// Run from the package root (the folder with orca-plugin.json)
let root = FileManager.default.currentDirectoryPath
let sourcePath = root + "/sources/en-1.4.230.json"
let outputPath = root + "/sources/vi-draft-last.json"

func flatten(_ value: Any, prefix: String = "", into output: inout [(String, String)]) {
    guard let object = value as? [String: Any] else { return }
    for key in object.keys.sorted() {
        let path = prefix.isEmpty ? key : "\(prefix).\(key)"
        if let text = object[key] as? String { output.append((path, text)) }
        else if let child = object[key] { flatten(child, prefix: path, into: &output) }
    }
}

func unflatten(_ items: [String: String]) -> [String: Any] {
    var root: [String: Any] = [:]
    for key in items.keys.sorted() {
        let parts = key.split(separator: ".").map(String.init)
        func put(_ object: inout [String: Any], _ remaining: ArraySlice<String>, _ value: String) {
            guard let first = remaining.first else { return }
            if remaining.count == 1 { object[first] = value; return }
            var child = object[first] as? [String: Any] ?? [:]
            put(&child, remaining.dropFirst(), value)
            object[first] = child
        }
        put(&root, parts[...], items[key]!)
    }
    return root
}

func save(_ items: [String: String]) throws {
    let data = try JSONSerialization.data(withJSONObject: unflatten(items), options: [.prettyPrinted, .sortedKeys, .withoutEscapingSlashes])
    try data.write(to: URL(fileURLWithPath: outputPath), options: .atomic)
}

@main
struct BulkTranslate: App {
    var body: some Scene {
        WindowGroup {
            Text("Translating the Orca interface…")
                .frame(width: 400, height: 120)
                .translationTask(source: Locale.Language(identifier: "en"), target: Locale.Language(identifier: "vi")) { session in
                    do {
                        try await session.prepareTranslation()
                        let data = try Data(contentsOf: URL(fileURLWithPath: sourcePath))
                        let source = try JSONSerialization.jsonObject(with: data)
                        var entries: [(String, String)] = []
                        flatten(source, into: &entries)
                        let eligibleFull = entries.filter { key, value in
                            !key.hasPrefix("auto.components.settings.Plugin") &&
                            !key.hasPrefix("auto.components.settings.plugin") &&
                            !value.isEmpty && value.count <= 8192
                        }
                        let eligible = eligibleFull.filter { $0.0 >= "auto.components.skills.SkillUpdateRow.manyLocations" }
                        var translated: [String: String] = [:]
                        if FileManager.default.fileExists(atPath: outputPath) {
                            let existing = try Data(contentsOf: URL(fileURLWithPath: outputPath))
                            var pairs: [(String, String)] = []
                            flatten(try JSONSerialization.jsonObject(with: existing), into: &pairs)
                            translated = Dictionary(uniqueKeysWithValues: pairs)
                        }
                        let regex = try NSRegularExpression(pattern: "\\{\\{[^{}]+\\}\\}|\\{[a-zA-Z][a-zA-Z0-9_]*\\}")
                        var done = 0
                        for groupStart in stride(from: 0, to: eligible.count, by: 40) {
                            let batch = Array(eligible[groupStart..<min(groupStart + 40, eligible.count)])
                            let pending = batch.filter { translated[$0.0] == nil }
                            if pending.isEmpty { continue }
                            let requests = pending.map { (key, value) in
                                TranslationSession.Request(sourceText: value, clientIdentifier: key)
                            }
                            do {
                                let responses = try await session.translations(from: requests)
                                for response in responses {
                                    guard let key = response.clientIdentifier,
                                          let original = pending.first(where: { $0.0 == key })?.1 else { continue }
                                    let target = response.targetText.trimmingCharacters(in: .whitespacesAndNewlines)
                                    let range = NSRange(original.startIndex..<original.endIndex, in: original)
                                    let before = regex.matches(in: original, range: range).compactMap { Range($0.range, in: original).map { String(original[$0]) } }.sorted()
                                    let targetRange = NSRange(target.startIndex..<target.endIndex, in: target)
                                    let after = regex.matches(in: target, range: targetRange).compactMap { Range($0.range, in: target).map { String(target[$0]) } }.sorted()
                                    if !target.isEmpty && before == after && target.count <= 8192 {
                                        translated[key] = target
                                    }
                                }
                            } catch {
                                fputs("BATCH ERROR \(groupStart): \(error)\n", stderr)
                            }
                            done += pending.count
                            if done % 200 < 40 {
                                try save(translated)
                                print("PROGRESS \(translated.count)/\(eligible.count)")
                                fflush(stdout)
                            }
                        }
                        try save(translated)
                        print("DONE \(translated.count)/\(eligible.count)")
                    } catch {
                        fputs("FATAL: \(error)\n", stderr)
                    }
                    NSApplication.shared.terminate(nil)
                }
        }
    }
}
