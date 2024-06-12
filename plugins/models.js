import User from '../models/User'
import Autonumber from '../models/Autonumber'
import AttendanceRecord from '../models/AttendanceRecord'
import Customer from '../models/Customer'
import Site from '../models/Site'
import Employee from '../models/Employee'
import Outsourcer from '../models/Outsourcer'
import LeaveApplication from '../models/LeaveApplication'
import TemporarySiteSchedule from '../models/TemporarySiteSchedule'
import SiteOperationSchedule from '../models/SiteOperationSchedule'
import Equipment from '../models/Equipment'
import EquipmentReceiving from '../models/EquipmentReceiving'
import OperationResult from '../models/OperationResult'
import SiteContract from '../models/SiteContract'

export default (context, inject) => {
  inject('User', (item) => new User(context, item))
  inject('Autonumber', (item) => new Autonumber(context, item))
  inject('AttendanceRecord', (item) => new AttendanceRecord(context, item))
  inject('Customer', (item) => new Customer(context, item))
  inject('Site', (item) => new Site(context, item))
  inject('Employee', (item) => new Employee(context, item))
  inject('Outsourcer', (item) => new Outsourcer(context, item))
  inject('LeaveApplication', (item) => new LeaveApplication(context, item))
  inject(
    'TemporarySiteSchedule',
    (item) => new TemporarySiteSchedule(context, item)
  )
  inject(
    'SiteOperationSchedule',
    (item) => new SiteOperationSchedule(context, item)
  )
  inject('Equipment', (item) => new Equipment(context, item))
  inject('EquipmentReceiving', (item) => new EquipmentReceiving(context, item))
  inject('OperationResult', (item) => new OperationResult(context, item))
  inject(
    'SiteContract',
    (siteId, item) => new SiteContract(context, siteId, item)
  )
}
