import Foundation
import Vision
import AppKit
// Aufruf: ocr <Ordner mit PNG-Seiten> <Ausgabedatei>
let dir = CommandLine.arguments[1]
let ausgabe = CommandLine.arguments[2]
let files = try FileManager.default.contentsOfDirectory(atPath: dir).filter{$0.hasSuffix(".png")}.sorted()
var out = ""
for f in files {
    let url = URL(fileURLWithPath: dir + "/" + f)
    guard let img = NSImage(contentsOf: url), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { continue }
    let req = VNRecognizeTextRequest()
    req.recognitionLevel = .accurate
    req.recognitionLanguages = ["de-DE"]
    req.usesLanguageCorrection = true
    try VNImageRequestHandler(cgImage: cg, options: [:]).perform([req])
    let lines = (req.results ?? []).compactMap { $0.topCandidates(1).first?.string }
    out += "\n=====BILD \(f) =====\n" + lines.joined(separator: "\n") + "\n"
}
try out.write(toFile: ausgabe, atomically: true, encoding: .utf8)
print("done", files.count)
