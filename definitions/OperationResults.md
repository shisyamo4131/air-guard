# 稼働実績

現場の稼働実績を管理するためのコレクション。`Sites`のサブコレクションとして配置する。

```
Sites/{siteId}/OperationResults
```

## 概要

- とりあえず MS-Access 版 AirGuard に存在するデータで必要最低限のものを実装。
- 単価や請求額については仕様が確定するまで未実装の状態にしておく。
- `docId`は自動付与。
- `code`は自動採番。桁数などの仕様は MS-Access 版 AirGuard に合わせる。
- 締日`deadline`を自動計算させるにあたって、`site`を保有していた方が都合が良い。
- Cloud Functions で`Sites`->`OperationResults`の同期をすること。
  - `Customers`ドキュメントの更新も反映されるようになる。
  - `Customers`ドキュメントの締日の変更に対する`deadline`の自動更新は`不要`。

@version 1.0.0
@updates

- 2024-08-07 - 初版作成

## OperationResults - Firestore

```
docId: { type: String, default: '', required: false },
code: { type: String, default: '', required: false },
siteId: { type: String, default: '', required: false },
site: { type: Object, default: () => ({}), required: false },
date: { type: String, default: '', required: false },
dayDiv: {
  type: String,
  default: 'weekday',
  validator: (v) => ['weekday', 'saturday', 'sunday', 'holiday'],
  required: false,
},
workShift: {
  type: String,
  default: 'day',
  validator: (v) => ['day', 'night'].includes(v),
  required: false
},
deadline: { type: String, default: '', required: false },
workers: { type: Array, default: () => [], required: false },
remarks: { type: String, default: '', required: false },
```

### OperationResultWorker

```
{
  employeeId: string,
  startTime: string,
  endTime: string,
  endAtNextday: boolean,
  breakMinute: number,
  workMinute: number,
  overtimeMinute: number,
  nighttimeMinute: number,
  qualification: boolean,
  ojt: boolean,
}
```

## インポート

稼働実績のインポートは 2 段階に分ける。

- ヘッダとなる`OperationResults`ドキュメントとしてのインポート
- 明細となる`workers`を別途インポート
