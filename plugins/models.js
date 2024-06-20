import User from '../models/User'
import Autonumber from '../models/Autonumber'
import AttendanceRecord from '../models/AttendanceRecord'
import Customer from '../models/Customer'
import Site from '../models/Site'
import Employee from '../models/Employee'
import Outsourcer from '../models/Outsourcer'
import LeaveApplication from '../models/LeaveApplication'
import SiteOperationSchedule from '../models/SiteOperationSchedule'
import Equipment from '../models/Equipment'
import EquipmentReceiving from '../models/EquipmentReceiving'
import OperationResult from '../models/OperationResult'
import SiteContract from '../models/SiteContract'

export default (context, inject) => {
  const firebase = {
    firestore: context.app.$firestore,
    auth: context.app.$auth,
  }
  inject('User', (item) => new User(firebase, item))
  inject('Autonumber', (item) => new Autonumber(firebase, item))
  inject('AttendanceRecord', (item) => new AttendanceRecord(firebase, item))
  inject('Customer', (item) => new Customer(firebase, item))
  inject('Site', (item) => new Site(firebase, item))
  inject('Employee', (item) => new Employee(firebase, item))
  inject('Outsourcer', (item) => new Outsourcer(firebase, item))
  inject('LeaveApplication', (item) => new LeaveApplication(firebase, item))
  inject(
    'SiteOperationSchedule',
    (item) => new SiteOperationSchedule(firebase, item)
  )
  inject('Equipment', (item) => new Equipment(firebase, item))
  inject('EquipmentReceiving', (item) => new EquipmentReceiving(firebase, item))
  inject('OperationResult', (item) => new OperationResult(firebase, item))
  inject(
    'SiteContract',
    (siteId, item) => new SiteContract(firebase, siteId, item)
  )
}
