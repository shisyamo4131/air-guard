import { defineString } from 'firebase-functions/params'
import { logger } from 'firebase-functions/v2'

// Firebase Functions v2 の defineString を使用
const GEOCODING_API_KEY = defineString('GEOCODING_API_KEY')

/**
 * 住所から緯度・経度・正規化住所を取得する
 * @param {string} address - 住所
 * @returns {Promise<{ lat: number, lng: number, formattedAddress: string } | null>}
 */
export async function fetchCoordinates(address) {
  if (!address || typeof address !== 'string') {
    logger.warn('[fetchCoordinates] 無効な住所が渡されました:', address)
    return null
  }

  const apiKey = GEOCODING_API_KEY.value()
  if (!apiKey) {
    logger.error('[fetchCoordinates] APIキーが設定されていません')
    throw new Error('API key is missing')
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status === 'OK') {
      logger.info(
        `[fetchCoordinates] 取得した座標: ${data.results[0].geometry.location.lat}, ${data.results[0].geometry.location.lng}`
      )
      return {
        lat: data.results[0].geometry.location.lat,
        lng: data.results[0].geometry.location.lng,
        formattedAddress: data.results[0].formatted_address,
      }
    } else {
      /**
       * 2025-02-08 毎日、最初の1件がここに入る。
       *            null を返しているのに呼び出し元で null 評価がなされない。
       *            -> `不正な住所である可能性があります。` が出力されない。
       *            一旦、この関数に入ってきている address を表示してみる。
       */
      logger.warn(
        `[fetchCoordinates] Geocoding API から有効なデータを取得できませんでした: ${address}`,
        data
      )
      return null
    }
  } catch (error) {
    logger.error('[fetchCoordinates] Geocoding API 呼び出し失敗:', error)
    return null
  }
}
