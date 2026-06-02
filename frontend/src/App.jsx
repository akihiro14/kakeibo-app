import { useState, useEffect } from 'react';
import ReceiptUpload from './components/ReceiptUpload.jsx';
import ItemList from './components/ItemList.jsx';
import Charts from './components/Charts.jsx';

// ローカルストレージのキー
const STORAGE_KEY = 'kakeibo-entries';

export default function App() {
  // 初期値をローカルストレージから読み込む
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // エントリが変わるたびにローカルストレージへ保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // レシート解析結果を一意なIDと登録日時を付与して追加
  const handleReceiptParsed = (data) => {
    const entry = {
      ...data,
      id: crypto.randomUUID(),
      registeredAt: new Date().toISOString(),
    };
    setEntries((prev) => [entry, ...prev]);
  };

  const handleDelete = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="container">
      <h1>レシート読み込み家計簿</h1>

      <ReceiptUpload
        onParsed={handleReceiptParsed}
        loading={loading}
        setLoading={setLoading}
        error={error}
        setError={setError}
      />

      {entries.length > 0 && (
        <>
          <Charts entries={entries} />
          <ItemList entries={entries} onDelete={handleDelete} />
        </>
      )}

      {entries.length === 0 && !loading && (
        <p className="empty-message">レシートをアップロードして家計簿を始めましょう</p>
      )}
    </div>
  );
}
