import Application from '../models/Application'
import Customer from '../models/Customer'
import Employee from '../models/Employee'
import Site from '../models/Site'

export default (context, inject) => {
  inject('Application', (item) => new Application(context, item))
  inject('Customer', (item) => new Customer(context, item))
  inject('Employee', (item) => new Employee(context, item))
  inject('Site', (item) => new Site(context, item))
}
