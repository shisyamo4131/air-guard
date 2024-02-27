import Autonumber from '../models/Autonumber'
import LeaveApplication from '../models/LeaveApplication'
import Customer from '../models/Customer'
import Employee from '../models/Employee'
import OperationResult from '../models/OperationResult'
import Site from '../models/Site'

export default (context, inject) => {
  inject('Autonumber', (item) => new Autonumber(context, item))
  inject('LeaveApplication', (item) => new LeaveApplication(context, item))
  inject('Customer', (item) => new Customer(context, item))
  inject('Employee', (item) => new Employee(context, item))
  inject('OperationResult', (item) => new OperationResult(context, item))
  inject('Site', (item) => new Site(context, item))
}
