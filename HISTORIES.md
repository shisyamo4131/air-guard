# Node Updates

- 2024-10-20 - v18.11.0 -> v18.12.0

# Firebase Updates

- 2024-11-16 - v13.20.2 -> v13.25.0
- 2024-10-17 - v13.20.2 -> v13.22.1 （どうやらインストールできていなかった模様）
- 2024-10-04 - v13.16.0 -> v13.20.2

# Firebase Functions Updates

- 2024-10-24 - ^v5.1.1 -> ^v6.1.0

# System Updates

## 2024-11-16 - ver 0.2.0

- 稼働実績の編集画面が tile 表示されるように修正
- GDialogInput がモバイルの時にフルスクリーン表示されるように修正
- GDialogInput が default スロットに tile を追加 / スロットに配置される GInput コンポーネントがモバイルの時に tile 表示になるように
- GCardinputForm の VCardTitle を VToolbar に変更し、レイアウトを調整
- GCheckboxDeleteData の hideDetails の既定値を true に設定
- pages から不要なファイルを削除
- atoms.renderless.ARenderlessCrud.vue を削除
- Vuex.systems をリファクタリング
- Placement クラスが date, siteId, workShift を受け取った途端に subscribe してしまうのを回避
- Placement クラスの date, siteId, workShift プロパティが必須になってしまっていたのを修正
- 日次バッチメンテナンスに（Cloud Functions）配置データの削除処理を追加。暫定で保存日数を 1 週間に設定。
- アプリメンテナンスに配置データの削除処理を実装。

## 2024-11-15 - ver 0.1.0

- 配置管理機能のレイアウトを調整
- 配置管理機能に現場-勤務区分へのジャンプ機能を実装
- 配置管理に関わるコンポーネントのコードをリファクタリング
- 従業員のインデックスに肩書、雇用形態を追加
- GComboboxDate でアイコンクリックでカレンダーが起動するように修正
- 権限管理に `管理者` を追加（既存の `管理者` を `アドミニストレータ` に変更）
- ユーザー管理で `管理者` 権限を制御できるように機能を追加
- 現場管理を管理者権限に公開
- 勤務指示テキストに従業員の肩書を出力するように修正

## 2024-11-14 - ver 0.0.1

- 勤務指示用テキストに肩書を適用するため、従業員管理に肩書を追加
