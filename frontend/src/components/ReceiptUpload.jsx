import { useRef } from 'react';

// レシート画像をバックエンドに送信して解析するアップロードコンポーネント
export default function ReceiptUpload({ onParsed, loading, setLoading, error, setError }) {
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // FileReaderでBase64に変換（data:xxx;base64, の後ろだけ取り出す）
      const base64 = await toBase64(file);

      const res = await fetch('/api/parse-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType: file.type }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '解析に失敗しました');
      }

      const data = await res.json();
      onParsed(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      // 同じファイルを再アップロードできるようinputをリセット
      inputRef.current.value = '';
    }
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="upload-section">
      <div
        className={`drop-zone${loading ? ' loading' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !loading && inputRef.current.click()}
      >
        {loading ? (
          <p>レシートを解析中...</p>
        ) : (
          <>
            <p>クリックまたはドラッグ＆ドロップで画像をアップロード</p>
            <p className="sub-text">対応形式: JPEG / PNG / GIF / WEBP</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
