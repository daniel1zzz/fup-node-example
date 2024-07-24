import { ChangeEvent, useEffect, useState } from "react";
import { composeFileUpload, composeMultipleFilesUpload } from "fup-node-front";

export default function App() {
  const [images, setImages] = useState([]);

  const getImages = async () => {
    const response = await fetch("http://localhost:3000/images");
    setImages(await response.json());
  };

  const uploadFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length == 0) return;

    let data = {};
    if (e.target.files?.length == 1) {
      data = { file: await composeFileUpload(e.target.files) };
    } else {
      data = { files: await composeMultipleFilesUpload(e.target.files) };
    }

    const response = await fetch(
      `http://localhost:3000/${
        e.target.files?.length == 1 ? "upload-file" : "upload-files"
      }`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      getImages();
      alert(await response.text())
    }
    else alert(await response.text());
  };

  useEffect(() => {
    getImages();
  }, [images]);

  return (
    <div className="mt-24">
      <div className="flex flex-col text-center gap-4">
        <h1 className="text-4xl font-bold">Upload files</h1>
        <p className="font-medium text-lg">
          Example of gallery to upload images with fup-node
        </p>
      </div>
      <div className="flex flex-col items-center mt-8">
        <div className="max-w-sm">
          <input
            className="block w-full h-7 text-sm border border-gray-600 rounded-md cursor-pointer focus:outline-none"
            id="file_input"
            name="files_upload"
            type="file"
            multiple
            onChange={uploadFiles}
          />
          <label
            className="mt-2 ml-1 block mb-2 text-sm text-gray-300"
            htmlFor="file_input"
          >
            Maximum 4 files of 6MB
          </label>
        </div>
      </div>
      <div className="mt-10 mb-10 flex justify-center">
        <section className="gap-6 h-max grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {images.map((e, i) => (
            <article key={i} className="max-w-xs">
              <img
                src={`http://localhost:3000/image/${e}`}
                alt="Image uploaded!"
                className="object-cover rounded-lg"
              />
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
