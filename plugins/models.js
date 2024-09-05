// import Customer from '../models/Customer'

import User from '../models/User'
// import Autonumber from '../models/Autonumber'
// import AttendanceRecord from '../models/AttendanceRecord'
// import Employee from '../models/Employee'
// import EmployeeContract from '../models/EmployeeContract'
// import EmployeeMedicalCheckup from '../models/EmployeeMedicalCheckup'
// import Outsourcer from '../models/Outsourcer'
// import Equipment from '../models/Equipment'
// import OperationResult from '../models/OperationResult'
// import OperationResultWorker from '../models/OperationResultWorker'
// import OperationWorkResult from '../models/OperationWorkResult'
// import Site from '../models/Site'
// import SiteContract from '../models/SiteContract'
// import SiteOperationSchedule from '../models/SiteOperationSchedule'
// import SiteOperationScheduleBulk from '../models/SiteOperationScheduleBulk'
// import TransportationCostApplication from '../models/TransportationCostApplication'
// import WorkRegulation from '../models/WorkRegulation'

export default (context, inject) => {
  const firebase = {
    firestore: context.app.$firestore,
    auth: context.app.$auth,
  }
  // inject('Customer', (item) => new Customer(item))

  inject('User', (item) => new User(firebase, item))
  // inject('Autonumber', (item) => new Autonumber(firebase, item))
  // inject('AttendanceRecord', (item) => new AttendanceRecord(firebase, item))
  // inject('Site', (item) => new Site(firebase, item))
  // inject('SiteContract', (item) => new SiteContract(firebase, item))
  // inject(
  //   'SiteOperationSchedule',
  //   (item) => new SiteOperationSchedule(firebase, item)
  // )
  // inject(
  //   'SiteOperationScheduleBulk',
  //   (item) => new SiteOperationScheduleBulk(firebase, item)
  // )
  // inject(
  //   'TransportationCostApplication',
  //   (item) => new TransportationCostApplication(item)
  // )
  // inject('Employee', (item) => new Employee(firebase, item))
  // inject('EmployeeContract', (item) => new EmployeeContract(firebase, item))
  // inject(
  //   'EmployeeMedicalCheckup',
  //   (item) => new EmployeeMedicalCheckup(firebase, item)
  // )
  // inject('Outsourcer', (item) => new Outsourcer(firebase, item))
  // inject('Equipment', (item) => new Equipment(firebase, item))
  // inject('OperationResult', (item) => new OperationResult(firebase, item))
  // inject('OperationResultWorker', (item) => new OperationResultWorker(item))
  // inject(
  //   'OperationWorkResult',
  //   (item) => new OperationWorkResult(firebase, item)
  // )
  // inject('WorkRegulation', (item) => new WorkRegulation(firebase, item))
}
