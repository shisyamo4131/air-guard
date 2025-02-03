import { onRequest } from 'firebase-functions/https'
import { fetchCoordinates } from './utils/geocoding.js'

// CORS 設定
const allowedOrigins = [
  'https://air-guard-dev-eea8e.web.app', // 本番環境
  'http://localhost:3000', // ローカル環境（ポートは必要に応じて変更）
]

/**
 * Geocode 関数
 *
 * クエリパラメータとして指定された住所を Google Maps Geocoding API で座標情報（緯度・経度）に変換して返します。
 *
 * @param {Object} req - HTTP リクエストオブジェクト
 * @param {Object} res - HTTP レスポンスオブジェクト
 * @returns {JSON} - 住所の緯度・経度、フォーマット済み住所を JSON で返す
 *
 * 【リクエスト例】
 * local: http://127.0.0.1:5001/air-guard-dev-eea8e/asia-northeast1/geocode?address=東京都渋谷区道玄坂2-10-12
 * prod: https://asia-northeast1-air-guard-dev-eea8e.cloudfunctions.net/geocode?address=東京都渋谷区道玄坂2-10-12
 *
 * 【レスポンス例（成功時）】
 * {
 *   "lat": 35.6586806,
 *   "lng": 139.6976457,
 *   "formattedAddress": "2-chōme-10-12 Dōgenzaka, Shibuya, Tokyo 150-0043, Japan"
 * }
 *
 * 【レスポンス例（エラー時）】
 * {
 *   "error": "Address is required"
 * }
 */
export const geocode = onRequest(
  { region: 'asia-northeast1', cors: allowedOrigins },
  // { region: 'asia-northeast1', cors: true },
  async (req, res) => {
    const { address } = req.query
    if (!address) {
      return res.status(400).json({ error: 'Address is required' })
    }

    const coordinates = await fetchCoordinates(address)
    if (coordinates) {
      res.json(coordinates)
    } else {
      res.status(400).json({ error: 'Geocode failed' })
    }
  }
)
