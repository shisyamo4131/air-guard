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
          cost: number // 自宅と現場を往復するのにかかった交通費
          createAt: number, // データ作成（更新）日時（timestamp）
        },
      },
      total: number, // `cost`の合計
      status: string,
      // ['creating', 'draft', 'pending', 'approved', 'rejected']
      createAt: number, // データ作成（更新）日時（timestamp）
      draftAt: number, // 申請受付開始日時（timestamp）
      pendingAt: number, // 申請日時（timestamp）
      approvedAt: number, // 承認日時（timestamp）
      rejectedAt: number, // 差し戻し日時（timestamp）
      settledAt: number, // 精算日時（timestamp）
    }
  }
}
```

- データは稼働実績が作成されると Cloud Functions によって`status`が`creating`の状態で作成される。
- 稼働実績が更新されると Cloud Functions によって稼働実績データ部が更新される。
- 稼働実績が削除され、ある日の稼働実績件数が 0 件になるとデータは削除される。
- 従業員が申請する際に必要となる情報（勤務日や現場名など）をデータに含める。
- 稼働実績の確認も兼ねるため、勤怠情報（開始時刻、終了時刻など）もデータに含める。
- 現場マスタへの参照を避けるため、現場名もデータに含める。
  - 現場マスタの更新トリガーによる同期処理は不要。
- `status`の状態にかかわらず、データは稼働実績と同期される。
- AirGuard にて、期間を指定して`status`を`draft`に変更する。
