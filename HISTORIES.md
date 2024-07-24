## 実装計画

### 雇用契約満了アラート

- `pages.index`の雇用契約満了アラートをコンポーネント化？
- `GEmployeeContractsManager`で、雇用契約満了対象の場合にアラート表示を追加。

### マスタデータの Vuex 化

やはり、マスタデータは Vuex で読み込んでおくとコーディングの難易度が大きく下がる。
とはいえ、すべてマスタデータを読み込んでおくことは不可能（現場の数が多すぎる）であるため、`status === 'active'`なマスタデータのみ読み込んでおくことにする。

- `Customers`の Vuex 化
- `Sites`の Vuex 化
  - `Sites`については Vuex 化の前に AirGuard で不要（古い）データを`稼働終了`にしておくべき。

### 現場スケジュールの管理機能実装

各現場の稼働予定を登録・管理できるような機能を実装。

## 24th July 2024

### Vuex.employee-contracts

- 雇用契約に関する様々な機能を提供するストアとして新規作成
- `getters/expiringSoon`により、30 日以内に雇用契約満了を迎え、かつ予定されている雇用契約が存在しない雇用契約を取得可能に。
- `getters/current`関数により、指定した雇用契約のドキュメント id が現在有効かつ最新のものかどうかを判断できるように。

### GDataTableEmployeeContracts

- 純粋なデータ表示用コンポーネントに変更。
- 現在有効な雇用契約である場合、契約日の前に`mdi-play`アイコンを表示。

### GEmployeeContracts

- 従業員の雇用契約管理用コンポーネントとして新規に実装。

### GCardEmployee

- 雇用契約に関する機能を削除。

### pages.employees.\_docId

- `GEmployeeContracts`を配置し、雇用契約に対するリアルタイムリスナーを削除。

### GInputEmployeeContract

- `editMode`が`REGIST`以外の時は契約日を編集不可にした。

### pages.index

- 暫定で雇用契約満了アラートの為のコンポーネントを配置。将来改善予定。

## 23th July 2024

### GInputEmployee

- 氏名から略称を自動入力できる機能を実装。
- 登録時や編集時には不要になると思われる退職日と退職事由を削除。退職処理については別途実装する。
