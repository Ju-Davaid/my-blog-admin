import SparkMD5 from "spark-md5";

const getFileMd5 = (file: File, onProgress?: (progress: number) => void) => {
  return new Promise((resolve, reject) => {
    const chunkSize = 2 * 1024 * 1024; // 2MB 一块
    const chunks = Math.ceil(file.size / chunkSize);
    const spark = new SparkMD5.ArrayBuffer();
    const reader = new FileReader();
    let current = 0;

    reader.onload = (e) => {
      const target = e.target!;
      spark.append(target.result as ArrayBuffer);
      current++;
      onProgress?.(current / chunks);
      if (current < chunks) {
        readNext();
      } else {
        resolve(spark.end());
      }
    };
    reader.onerror = () => reject(reader.error);

    function readNext() {
      const start = current * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      reader.readAsArrayBuffer(file.slice(start, end));
    }

    // 空文件也要处理
    if (file.size === 0) {
      resolve(spark.end());
    } else {
      readNext();
    }
  });
};

export default getFileMd5;
