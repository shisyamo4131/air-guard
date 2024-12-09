<template>
  <div>
    <button @click="generatePdf">PDFを生成</button>
  </div>
</template>

<script>
export default {
  methods: {
    generatePdf() {
      const data = {
        name: '金子 真樹',
        postalCode: '120-0013',
        address: '東京都足立区弘道一丁目21番11号 コーポすずき302',
        contractStartDate: '令和06年11月01日',
        employmentType: '正社員',
        jobDescription:
          '警備業務および補助的業務、並びにそれらに付帯する一切の業務',
        salaryType: '月給',
        basicSalary: '246,000',
        positionAllowance: '85,000',
        qualificationAllowance: '20,000',
        familyAllowance: '0',
        bonus: '有',
        startTime: '8:00',
        endTime: '17:00',
        breakTime: '60分',
        legalHoliday: '日',
        nonLegalHoliday: '土',
        healthInsurance: '加入',
        pension: '加入',
        employmentInsurance: '加入',
        remarks: '令和６年１１月１日より、家族手当の支給を停止します。',
        companyName: '株式会社　唯心',
        representativeName: '丸山 大三',
        companyAddress: '東京都台東区清川１－２３－１',
      }

      this.$GENERATE_LABOR_TERMS(data, { download: false })
    },
  },
}
</script>
