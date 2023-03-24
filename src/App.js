import React, { useState, useCallback } from "react";
import { S3 } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { useDropzone } from "react-dropzone";
import FileIcon from './file-icon.png';
import "./App.css";

const s3 = new S3({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

const App = () => {
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [videoURL, setVideoURL] = useState(null);

  const onDrop = useCallback(([file]) => {
    if (file.type !== "video/mp4") {
      alert("Only MP4 files are allowed");
      return;
    }

    const key = `videos/${uuidv4()}.mp4`;
    const params = {
      Bucket: "shayan-react-upload",
      Key: key,
      ContentType: file.type,
      Body: file,
    };

    s3.upload(params)
      .on("httpUploadProgress", (evt) => {
        setProgress(Math.round((evt.loaded / evt.total) * 100));
      })
      .send((err, data) => {
        if (err) {
          console.error("Error uploading the file:", err);
        } else {
          console.log("File uploaded successfully:", data);
          setUploaded(true);
          setVideoURL(data.Location);
        }
      });
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: "video/mp4",
  });

  return (
    <div className="App">
      {uploaded && videoURL && (
        <div className="video-container">
          <video src={videoURL} controls></video>
        </div>
      )}
      <div className="card">
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          <img src={FileIcon} alt="File Icon" />
          <p>Drop your MP4 file here, or <span onClick={open}>browse</span></p>
        </div>
      </div>
      {progress > 0 && progress < 100 && (
            <div className="progress-container">
              <span className="progress-text">Uploading {progress}%</span>
              <div className="progress-bar">
                <span className="progress-fill" style={{ width: `${progress}%` }}></span>
              </div>
            </div>
          )}
    </div>
  );
};

export default App;
