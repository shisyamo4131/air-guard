const GEOCODING_API_URL =
  process.env.NODE_ENV === 'local'
    ? `http://localhost:5001/${process.env.PROJECT_ID}/asia-northeast1/geocode`
    : `https://asia-northeast1-${process.env.PROJECT_ID}.cloudfunctions.net/geocode`

/**
 * 住所から緯度・経度を取得する
 * @param {string} address - 住所
 * @returns {Promise<{ lat: number, lng: number } | null>} - 緯度・経度のオブジェクト（取得できなかった場合は null）
 */
export async function fetchCoordinates(address) {
  if (!address || typeof address !== 'string') {
    console.warn('[fetchCoordinates] 無効な住所が渡されました:', address)
    return null
  }

  try {
    console.log(`[fetchCoordinates] Geocoding API を呼び出し: ${address}`)

    const response = await fetch(
      `${GEOCODING_API_URL}?address=${encodeURIComponent(address)}`
    )

    const data = await response.json()
    if (data.lat && data.lng) {
      console.log(`[fetchCoordinates] 取得した座標: ${data.lat}, ${data.lng}`)
      return {
        lat: data.lat,
        lng: data.lng,
        formattedAddress: data.formattedAddress,
      }
    } else {
      console.warn(
        '[fetchCoordinates] Geocoding API から座標を取得できませんでした:',
        data
      )
      return null
    }
  } catch (error) {
    console.error('[fetchCoordinates] Geocoding API 呼び出し失敗:', error)
    return null
  }
}
