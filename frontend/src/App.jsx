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
  const [warnings, setWarnings] = useState([]);

  // エントリが変わるたびにローカルストレージへ保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // レシート解析結果を検証してから登録する
  const handleReceiptParsed = (data) => {
    const newWarnings = [];

    // 負の金額を持つ商品をチェック
    const negativeItems = (data.items || []).filter((item) => item.price < 0);
    if (negativeItems.length > 0) {
      const names = negativeItems.map((i) => i.name).join('、');
      newWarnings.push(`金額が負の値の商品があります: ${names}`);
    }

    // 同一日付・同一合計金額の重複チェック
    const isDuplicate = entries.some(
      (e) => e.date === data.date && e.total === data.total
    );
    if (isDuplicate) {
      newWarnings.push(
        `同じ日付（${data.date}）・合計金額（¥${data.total?.toLocaleString()}）のレシートが既に登録されています`
      );
    }

    setWarnings(newWarnings);

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

      {warnings.length > 0 && (
        <div className="warnings">
          {warnings.map((msg, i) => (
            <div key={i} className="warning-item">
              <span>⚠ {msg}</span>
              <button
                className="warning-close"
                onClick={() => setWarnings((prev) => prev.filter((_, j) => j !== i))}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

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
