# 実装計画

### 現場管理

- 稼働終了にした現場のみを検索できる機能（画面）を用意して、通常の現場管理画面とは別にする。
  - 「稼働終了を含める」を`true`にした瞬間、1,000 件以上の読み込みが発生してしまう。

### 雇用契約満了アラート

- `pages.index`の雇用契約満了アラートをコンポーネント化？
- `GEmployeeContractsManager`で、雇用契約満了対象の場合にアラート表示を追加。

### リアルタイムリスナーによる Vuex のマスタデータ読み込み件数抑制

2024-07-25 現在、現場（Sites）については稼働状況が`稼働中`であるものを Vuex で subscribe するようになったが、現時点で 200 件以上の読み込みがある。

- アプリを起動した直後、読み込み件数が多いために画面がフリーズしたような動きをする。
- 一度読み込んでしまえばあとはスムーズ。

読み込みの件数を減少させることが重要。

- 一定期間、稼働のない現場についてアラートを出して稼働終了への更新を促す。
  - 最終稼働日の管理方法を検討しなくてはならない。
  - どちらにしても稼働実績の取り込み・管理機能が完成しないと不可能？

### 雇用契約書の PDF 出力

### 現場取極めの PDF 保存と表示

# 検討事項

### 現場稼働予定更新履歴

- 一定期間が過ぎたら削除するコードを埋めておかないと、Realtime Database が肥大化してしまう。
- 現場が終了したら？3 ヶ月？半年？
- 現場稼働予定が削除された時の更新履歴については備考欄を出力していないが、削除理由って必要なのでは？
  - とはいえ、削除事由を入力させる UI を用意しないといけない。
- 備考欄に入力できるテキストの量に制限を設けておかないと、大きなデータが保存されるかもしれない。

# 更新履歴

# 30th July 2024

### firebase-tools バージョンアップ

- 13.9.0 -> 13.14.2 にバージョンアップ

### Vuex.users

- 新規実装

### plugins/firebase.auth.js

- `users/subscribe`、`users/unsubscribe`を追加

### functions/modules/site-operation-schedule.js

- ドキュメントの更新時、更新前のデータを`before`として`pushHistory`に渡すように修正。

### GCardSiteOperationScheduleHistory

- `History/SiteOperationSchedules/{siteId}`の各ノードを表示するためのコンポーネントとして新規実装。
- 作成、変更、削除のそれぞれについて表示方法を細かく分け、特に変更時は「何がどう変更されたのか」を理解しやすく実装。

### GSiteOperationScheduleHistory

- 更新履歴表示部を`GCardSiteOperationScheduleHistory`に。
- `props.from`と`props.to`を追加。取得する更新履歴の範囲を特定するように修正。

### GSiteOperationScheduleCalendar

- `period`イベントを実装。現在カレンダーが表示している期間を`{from, to}`で受け取ることが可能に。

### pages.sites.\_docId

- 稼働予定のカレンダー部と履歴部の`$vuetify.breakpoint.md`におけるサイズ配分を調整。
- `data.schedulePeriod`を実装し、`GSiteOperationScheduleCalendar`の`period`イベントで`{from, to}`を同期。
- `data.schedulePeriod`の`{from, to}`を、それぞれ`GSiteOperationScheduleHistory`に引き渡すように修正。

### database.rules.json

- `History/SiteOperationSchedules/$siteId`に`.indexOn: ["date"]`としてインデックスを設定。

# 29th July 2024

### SiteOperationSchedules

- 現場稼働予定ドキュメントは、`siteId`、`date`、`workShift`の変更は不可能として仕様確定。
- 現場稼働予定ドキュメントの作成・更新・削除トリガーで`History/SiteOperationSchedules/{siteId}`に更新履歴を作成するように。
- 現場マスタのレイアウトを変更し、稼働予定の更新履歴を確認できるように機能を追加。

# 26th July 2024

### GDatePickerMultiple

- 選択モードや選択可能日の指定などの設定をダイアログ上で行えるように UI を変更。

### 現場稼働予定（SiteOperationSchedules）

#### model.SiteOperationSchedule

- 現場稼働予定の一括登録用として`dates`プロパティを用意。

#### model.SiteOperationScheduleBulk

- 現場稼働予定の一括登録用データモデルとして新規に作成。
- プロパティは`model.SiteOperationSchedule`を参照。

#### GDialogEditor

- 親コンポーネントで現在の編集モードを判断できるように`edit-mode`イベントを実装。

#### GInputSiteOperationScheduleBulk

- 現場稼働予定の一括登録用入力コンポーネントとして新規実装。

#### functions.SiteOperationSchedule

- Cloud Functions で`SiteOperationSchedule`ドキュメントを扱うためのモデルとして実装。

#### functions.site-operation-schedule-bulks

- 現場稼働予定の一括登録用モジュールを実装。
- ドキュメントが作成されると`dates`プロパティを参照して複数の`SiteOperationSchedule`ドキュメントを作成。
- 作成後は自身を削除する。

#### functions.site-operation-schedule

- 更新トリガーでの処理を実装。現場 id、稼働日、勤務区分のどれかが変更された際に、ドキュメント id との整合性を保つため、新規にドキュメントを作成し、作成元（変更されたドキュメント）を削除するように。
- これにより、現場 id が変更された際に従属先の`Site`ドキュメントを変更することにも対応可能に。

# 25th July 2024

### 取引先（Customers）の管理機能について一部修正。

#### Vuex.customers

- `actions.subscribe`で`status === 'active'`のもののみを抽出するように修正。

#### pages.customers.index

- `Vuex.customers`の仕様変更に伴う修正。
- 契約満了の取引先については`取引終了を含める`フラグが`true`になったときに読み込むように。
- 上記フラグの値が変わるたびに読み込みを行うことのないよう、`true`になったらフラグ操作不可に。

### 現場（Sites）の Vuex 化

#### MS 版 AirGuard

- 過去半年間、稼働がなかった現場について稼働状況を`稼働終了`に変更。
- local 環境および dev 環境に Sites を全件更新。

#### Vuex.sites

- 新規実装

#### plugins.firebase.auth.js

- `Vuex.sites`の`actions.subscribe`および`actions.unsubscribe`を追加。

#### pages.sites.index

- `Vuex.sites`の実装により全体的に仕様を変更。

### 取引先詳細画面

#### pages.customers.\_docId

- 現場管理機能として`GSitesManager`を新規に作成。

- 現場の管理機能を`GCardSites`から`GSitesManager`に変更。

- `GCardSites`を削除。

- `GDataTableSites`の表示カラムを breakpoint に応じて細かく変更。

### TEMPLATE

#### GTemplateIndex

- `v-pagination`の`total-visible`を 20 に設定。

# 24th July 2024

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

# 23th July 2024

### GInputEmployee

- 氏名から略称を自動入力できる機能を実装。
- 登録時や編集時には不要になると思われる退職日と退職事由を削除。退職処理については別途実装する。
