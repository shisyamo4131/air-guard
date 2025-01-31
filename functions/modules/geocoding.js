import { onRequest } from 'firebase-functions/https'
import { defineString } from 'firebase-functions/params'
import { logger } from 'firebase-functions/v2'

// Firebase Functions v2 の defineString を使用
const GEOCODING_API_KEY = defineString('GEOCODING_API_KEY')

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
  { region: 'asia-northeast1' },
  async (req, res) => {
    const { address } = req.query
    if (!address) {
      return res.status(400).json({ error: 'Address is required' })
    }

    // APIキーを defineString から取得（エミュレーター & デプロイ共通）
    const apiKey = GEOCODING_API_KEY.value()

    if (!apiKey) {
      logger.error('APIキーが設定されていません')
      return res.status(500).json({ error: 'API key is missing' })
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.status === 'OK') {
        res.json({
          lat: data.results[0].geometry.location.lat,
          lng: data.results[0].geometry.location.lng,
          formattedAddress: data.results[0].formatted_address,
        })
      } else {
        logger.error('Geocode APIエラー:', data)
        res.status(400).json({ error: data.status })
      }
    } catch (error) {
      logger.error('Geocode 処理中にエラー:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)
