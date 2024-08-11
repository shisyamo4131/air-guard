# 交通費申請

- 従業員の交通費申請データを管理する。Realtime Database を使用。
- `AirGuard-Client`（将来実装予定？）にログインしている従業員が自身のデータのみを扱う。
- 取得するデータ量を抑制するため、できる限りデータは細かくネストする。

## 状態遷移

申請データには日付ごとに状態を表す`status`を持たせる。

| 作成中   | 申請前 | 申請中  | 承認済み | 精算済み | 差し戻し | 期限切れ |
| -------- | ------ | ------- | -------- | -------- | -------- | -------- |
| creating | draft  | pending | approved | settled  | rejected | expired  |

### 作成中

稼働実績からデータが作成された状態。従業員はデータの閲覧不可能。

### 申請前

会社が従業員からの申請を受け付けている状態。従業員がデータを編集可能。従業員のアクションにより`申請中`に状態が遷移。

### 申請中

従業員がデータを編集し、申請した後の状態で、精算がまだ済んでいない状態。従業員はデータの閲覧のみ可能。会社がデータを承認することで`承認済み`に状態が遷移。

### 差し戻し

何らかの理由で会社が申請された交通費を差し戻した状態。従業員は再度データを編集することが可能で、再申請をすると`申請中`に状態が遷移する。

### 承認済み

会社が申請された交通費を承認した状態。従業員はデータの閲覧のみ可能。会社が交通費を精算すると`精算済み`に状態が遷移。この状態から`差し戻し`に遷移させるも可能。

### 精算済み

会社が申請された交通費を精算（支払った）状態。従業員はデータの閲覧のみ可能。精算した後の状態であるため、ここからの状態遷移は不可能。

### 期限切れ

従業員による規定期間内の申請が行われず、期限切れとなったデータです。

## データモデル

```
TransportationCostApplications: {
  $employeeId: {
    $date: { // 稼働日
      OperationResults: {
        $OperationResultId: { // 精算対象となる稼働実績ドキュメントのid
          siteId: string, // 現場ドキュメントid
          siteAbbr: string, // 現場名
          startTime: string, // 開始時刻
          endTime: string, // 終了時刻
          breakMinutes: number, // 休憩時間（分）
          overtimeMinutes: number, // 残業時間（分）
          cost: number // 交通費
          createAt: number, // データ作成（更新）日時（timestamp）
        },
      },
      total: number, // `cost`の合計
      status: string,
      // ['0:creating', '1:draft', '2:pending', '3:approved', '4:settled', '8:rejected', '9:expired']
      createAt: number, // データ作成（更新）日時（timestamp）
      draftAt: number, // 申請受付開始日時（timestamp）
      pendingAt: number, // 申請日時（timestamp）
      approvedAt: number, // 承認日時（timestamp）
      rejectedAt: number, // 差し戻し日時（timestamp）
      settledAt: number, // 精算日時（timestamp）
      expiredAt: number, // 期限切れとした日時（timestamp）
    }
  }
}
```

## 機能概要

### 交通費申請データの作成・更新・削除

- 交通費申請データは稼働実績`OperationResults`ドキュメントが作成・更新・削除されると Cloud Functions によって同期される。
- 交通費申請データの`status`の初期値は`creating`。
- 稼働実績`OperationResults`ドキュメントの作成・更新・削除によって交通費申請データの`status`が更新されることはない。

### 申請受付開始

- `status`が`creating`の状態では、従業員による交通費の申請（交通費データの編集）は不可能。
- AirGuard から`status`を`draft`に変更することで、申請を受け付けるようする。
- `status`の`draft`への更新は期間を指定して行う。その際、`status`が`2:pending`以降のデータについては更新対象が除外する。

### 申請受付

- `AirGuard-Client`から従業員自身が申請を行うことが原則。
- `AirGuard-Client`が使用できない従業員の申請を肩代わりする機能が必要。
- 申請は`日単位`で行い、申請が行われると`status`が`2:pending`に変更され、従業員からは変更できなくなる。
- `status`が`8:rejected`になっているデータも申請が可能とする。

### 承認・差し戻し処理

- 従業員からの申請内容を承認する機能。（`status`を`3:approved`に更新）
- 申請内容に疑義があるなどを理由に、差し戻すことも可能。（`status`を`8:rejected`に更新）

### 一覧表出力（振込データ作成？）

- `status`が`3:approved`のデータについて、一覧表を出力。
- できれば振込データ（全銀協フォーマット）を出力してみたい。

### 精算処理

- 従業員への精算（振込）が完了したデータの`status`を`4:settled`に更新する。

### 期限切れ処理

- 規定期間（会社のルール）を超過したデータについて、`status`を`9:expired`に更新する。
