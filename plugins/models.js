import User from '../models/User'
import Autonumber from '../models/Autonumber'
import Customer from '../models/Customer'
import Site from '../models/Site'
import Employee from '../models/Employee'
import Outsourcer from '../models/Outsourcer'
import LeaveApplication from '../models/LeaveApplication'
import TemporarySiteSchedule from '../models/TemporarySiteSchedule'
import Placement from '../models/Placement'
import OperationResult from '../models/OperationResult'
import SiteContract from '../models/SiteContract'

export default (context, inject) => {
  inject('User', (item) => new User(context, item))
  inject('Autonumber', (item) => new Autonumber(context, item))
  inject('Customer', (item) => new Customer(context, item))
  inject('Site', (item) => new Site(context, item))
  inject('Employee', (item) => new Employee(context, item))
  inject('Outsourcer', (item) => new Outsourcer(context, item))
  inject('LeaveApplication', (item) => new LeaveApplication(context, item))
  inject(
    'TemporarySiteSchedule',
    (item) => new TemporarySiteSchedule(context, item)
  )
  inject('Placement', (item) => new Placement(context, item))
  inject('OperationResult', (item) => new OperationResult(context, item))
  inject(
    'SiteContract',
    (siteId, item) => new SiteContract(context, siteId, item)
  )
}
