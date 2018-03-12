import * as fs from "fs";
import * as svgToImg from "../index";
import { md5 } from "./helpers";
import * as rimraf from "rimraf";
import * as sizeOf from "image-size";

const inputDir = "./src/tests/svg";
const outputDir = "./src/tests/img";
const svgBuffer = fs.readFileSync(`${inputDir}/camera.svg`);
const svgString = svgBuffer.toString("utf8");

// Create output directory
rimraf.sync(outputDir);
fs.mkdirSync(outputDir);

describe("SVG to image conversion", () => {
  test("From buffer to image", async () => {
    const data = await svgToImg.from(svgBuffer).to({
      type: "jpeg"
    });

    expect(sizeOf(data as Buffer)).toEqual({
      type: "jpg",
      width: 406,
      height: 206
    });
    expect(md5(data)).toEqual("3ecce9756c3d9d121fe17d04eba596ed");
  });

  test("From string to image", async () => {
    const data = await svgToImg.from(svgString).to({
      type: "png"
    });

    expect(sizeOf(data as Buffer)).toEqual({
      type: "png",
      width: 406,
      height: 206
    });
    expect(md5(data)).toEqual("9adf5c77f2851ee4a3bdfddea3bb501e");
  });

  test("Infer file type from file extension", async () => {
    await svgToImg.from(svgBuffer).to({
      path: `${outputDir}/image.jpg`
    });

    const data = fs.readFileSync(`${outputDir}/image.jpg`);

    expect(sizeOf(data as Buffer)).toEqual({
      type: "jpg",
      width: 406,
      height: 206
    });
    expect(md5(data)).toEqual("3ecce9756c3d9d121fe17d04eba596ed");
  });

  test("Unsupported file extension", async () => {
    await svgToImg.from(svgBuffer).to({
      path: `${outputDir}/image.ext`
    });

    const data = fs.readFileSync(`${outputDir}/image.ext`);

    expect(sizeOf(data as Buffer)).toEqual({
      type: "png",
      width: 406,
      height: 206
    });
    expect(md5(data)).toEqual("9adf5c77f2851ee4a3bdfddea3bb501e");
  });

  test("Base64 encoded output", async () => {
    const data = await svgToImg.from(svgString).to({
      encoding: "base64"
    });

    expect(sizeOf(Buffer.from(data as string, "base64"))).toEqual({
      type: "png",
      width: 406,
      height: 206
    });
    expect(md5(data)).toEqual("94aa9ee2cad3d0c6c665793d5cd7e55c");
  });

  test("Custom width and height", async () => {
    const data = await svgToImg.from(svgString).to({
      width: 1000,
      height: 200
    });

    expect(sizeOf(data as Buffer)).toEqual({
      type: "png",
      width: 1000,
      height: 200
    });
    expect(md5(data)).toEqual("ce65eea472df3b38bae00d9e5e6e8f0d");
  });

  test("Custom background", async () => {
    const data = await svgToImg.from(svgString).to({
      background: "#09f"
    });

    expect(sizeOf(data as Buffer)).toEqual({
      type: "png",
      width: 406,
      height: 206
    });
    expect(md5(data)).toEqual("481c7be3721221d3e0a00f9878203961");
  });

  test("Invalid SVG", async () => {
    try {
      await svgToImg.from("THIS IS NO SVG").to({
        type: "png"
      });
    } catch (error) {
      expect(error.toString()).toEqual("Error: Malformed SVG");
    }
  });
});