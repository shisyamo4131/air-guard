# OperationWorkResults コレクション

- 従業員別の稼働実績と交通費申請データを管理するコレクションで、各ドキュメントは`Cloud Functions`によって稼働実績`OperationResults`ドキュメントの`workers`フィールドと同期管理されます。
- ドキュメントの key は`operationResultId`と`employeeId`の組み合わせです。
- `transportationCost`フィールドを持ち、交通費の申請に関する情報はここで管理されます。
- `transportationCost.status`フィールドで交通費申請に関する状態遷移が管理されます。

## 状態（transportationCost.status）

交通費の申請状態を以下のように表します。

| 申請受付前 | 申請受付中 | 申請中    | 承認済み   | 精算済み  | 差し戻し   | 期限切れ  |
| ---------- | ---------- | --------- | ---------- | --------- | ---------- | --------- |
| 0:creating | 1:draft    | 2:pending | 3:approved | 4:settled | 8:rejected | 9:expired |

### 申請受付前（0:creating）

- 稼働実績`OperationResults`ドキュメントをもとに交通費申請データが作成されたばかりの状態
- 従業員はデータの閲覧が不可能

### 申請受付中（1:draft）

- 従業員からの申請を受け付けている状態。アプリ側でこの状態に遷移させます。また、アプリ側で`0:creating`に戻すことも可能です。
- 従業員がデータ（交通費）を編集可能です。
- 交通費`transportationCost.amount`を更新すると状態が申請中`2:pending`に更新されます。
- 当該稼働実績`OperationResults`の`workers`プロパティから、当該従業員の稼働実績を削除することはできません。（編集は可能）

### 申請中（2:pending）

‐ 従業員から交通費が申請され、まだ精算処理がされていない状態です。

- 従業員は引き続きデータ（交通費）を編集可能です。
- 当該稼働実績`OperationResults`の`workers`プロパティから、当該従業員の稼働実績を削除することはできません。（編集は可能）
- この状態から遷移可能なのは`3:approved`または`8:rejected`のみです。
- `8:rejected`にするためには、差し戻し理由をデータに含める必要があります。

### 承認済み（3:approved）

- 従業員から申請された交通費を承認した状態です。（まだ精算処理は行われていません）
- 従業員はデータ（交通費）の編集ができません。
- 当該稼働実績`OperationResults`の`workers`プロパティから、当該従業員の稼働実績を削除することはできません。（編集は可能）
- この状態から遷移可能なのは`2:pending`、`4:settled`のみです。承認の取消および精算済みを意味します。

### 差し戻し(8:rejected)

- 何らかの理由で申請された交通費を差し戻した状態です。
- 従業員は再度データ（交通費）を編集することが可能で、再申請をすると`2:pending`に状態が遷移します。

### 精算済み（4:settled）

- 申請された交通費を精算（支払った）状態です。
- 従業員はデータの閲覧のみ可能です。
- 誤って精算済みにしてしまったケースに対応するため、この状態から`3:approved`に戻すことが可能です。

### 期限切れ（9:expired）

- 期限切れとなった交通費データです。
- 2024-08-18 現在、この状態に遷移させるケースは見当たらず、アプリの機能として実装しません。

## データモデル

```
@property {string} employeeId - 従業員の一意の識別子
@property {string} startTime - 勤務開始時間 (フォーマット: "HH:mm")
@property {string} endTime - 勤務終了時間 (フォーマット: "HH:mm")
@property {boolean} endAtNextday - 勤務終了が翌日になるかどうかを示すフラグ
@property {number|null} breakMinute - 休憩時間 (分単位)。休憩がない場合は `null`
@property {number|null} workMinute - 実働時間 (分単位)。
@property {number|null} overtimeMinute - 残業時間 (分単位)。
@property {number|null} nighttimeMinute - 深夜勤務時間 (分単位)。
@property {boolean} qualification - 従業員が資格を保有しているかどうかを示すフラグ
@property {boolean} ojt - 従業員がOJT（On-the-Job Training）を実施したかどうかを示すフラグ
```
