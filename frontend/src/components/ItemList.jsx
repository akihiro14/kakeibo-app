// カテゴリ名をCSSクラス用の英字キーに変換するマップ
const CATEGORY_CLASS = {
  食費: 'food',
  日用品: 'daily',
  外食: 'dining',
  交通費: 'transport',
  娯楽: 'entertainment',
  その他: 'other',
};

// レシートごとの商品一覧カードを表示するコンポーネント
export default function ItemList({ entries, onDelete }) {
  return (
    <div className="item-list">
      <h2>登録履歴</h2>
      {entries.map((entry) => (
        <div key={entry.id} className="entry-card">
          <div className="entry-header">
            <div>
              <span className="store-name">{entry.store}</span>
              <span className="entry-date">{entry.date}</span>
            </div>
            <div className="entry-right">
              <span className="entry-total">合計: ¥{entry.total?.toLocaleString()}</span>
              <button className="delete-btn" onClick={() => onDelete(entry.id)}>
                削除
              </button>
            </div>
          </div>

          <table className="items-table">
            <thead>
              <tr>
                <th>商品名</th>
                <th>カテゴリ</th>
                <th>金額</th>
              </tr>
            </thead>
            <tbody>
              {entry.items?.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td>
                    <span
                      className={`category-badge category-${CATEGORY_CLASS[item.category] || 'other'}`}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td className="price-cell">¥{item.price?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
