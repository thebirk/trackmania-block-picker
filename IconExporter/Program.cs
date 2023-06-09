﻿using GBX.NET;
using GBX.NET.Engines.GameData;
using GBX.NET.Engines.TrackMania;

using ImageProcessor;
using ImageProcessor.Imaging.Formats;
using ImageProcessor.Plugins.WebP.Imaging.Formats;

if (args.Length != 2)
{
    Console.WriteLine("Usage: IconExporter <input folder> <output folder>");
    return;
}

var fileName = args[0];
var outPath = args[1];

string[] fileNames;

if (File.Exists(fileName))
{
    fileNames = new[] { fileName };
}
else
{
    fileNames = Directory.GetFiles(Path.GetDirectoryName(fileName)!, "*.Gbx", SearchOption.AllDirectories);
}

foreach (var filePath in fileNames)
{
    var node = GameBox.ParseNodeHeader(filePath);

    if (node is not CGameCtnCollector collector)
    {
        Console.WriteLine($"Ignoring '{filePath}'");
        continue;
    }

    var path = Path.Combine(outPath, collector.Name!.ToLowerInvariant());
    var webpFileName = path + ".webp";

    if (collector.IconWebP != null)
    {
        using var imageFactory = new ImageFactory(preserveExifData: false)
            .Load(collector.IconWebP)
            .Flip(flipVertically: true)
            .Format(new WebPFormat
            {
                Quality = 100,
            })
            .Save(webpFileName);
    }
    else
    {
        Console.WriteLine("{0} NOT exported!", filePath);
    }
}
