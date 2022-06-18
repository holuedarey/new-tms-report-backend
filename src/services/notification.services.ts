import NotificationModel from "../db/model/notificationservice.model";
import Util from "../helpers/utils";
// const UserService = require('./user.service');

import RegisteredNotification from "./reg-notification.services";

interface INotificationService {}

class NotificationService {
  async create(data: any) {

    const notification =  await NotificationModel.create(data);

    data.notificationService = notification._id;

    await this.registerNotification(data);
 
    return data;
  }

  async isNameExist(name: any) {
    return await NotificationModel.findOne({ name: name });
  }

  async UpdateOne(data: any, opt = null) {
    if (opt) {
      return await NotificationModel.updateOne({ _id: data }, opt);
    }

    return await NotificationModel.updateOne({ _id: data._id }, data);
  }

  async FindWithId(id: string) {
    return await NotificationModel.findOne({ _id: id });
  }

  async registerNotification(data: any) {

    let ser = {
      name: data.name,
      merchantId: data.merchantId || "",
      terminalId: data.terminalId || "",
      identifier: data.identifier || "",
      notificationService: data.notificationService,
      enabled: data.enabled,
      selectors: data.selectors || [],
    };
    const registered = await RegisteredNotification.create(ser);

    return registered;
  }

  async AddService(data: any, auth: any = null) {

    const checkName = await this.isNameExist(data.name);

    let ser = {
      name: data.name,
      url: data.url || "",
      key: data.key || "",
      acquirer: data.acquirer || "",
      reversalUrl: data.reversalUrl || "",
      notificationClass: data.notificationClass,
      enabled: data.enabled,
      authorizationToken: data.authorizationToken || "",
    };

    // UserService.writeAudit(auth,"added new notification service.").then().catch();

    return await this.create(ser);
  }

  async UpdateService(id: any, data: any) {
    let res = {
      err: false,
      // msg : "service updated successfully",
      data: null,
    };

    let service: any = await NotificationModel.findOne({ _id: id });

    if (!service) {
      res.err = true;
      // res.msg = "service not found!";
      return res;
    }

    // console.log(data.enable);
    // let enable;

    // flag === "true" ? (enable = false) : (enable = true);


    service.name = data?.name || service.name;
    service.url = data?.url || service.url;
    service.key = data?.key || service.key;
    service.acquirer = data?.acquirer || service.acquirer;
    service.reversalUrl = data?.reversalUrl || service.reversalUrl;
    service.notificationClass =
      data?.notificationClass || service.notificationClass;
    service.enabled = data?.enabled || false;
    service.authorizationToken =
      data?.authorizationToken || service.authorizationToken;

    await service.save();
    res.data = service;

    // UserService.writeAudit(auth,`updated service ${service.name}`).then().catch();

    return res;
  }

  async DeleteService(id: string, auth: any = null) {
    let res = {
      err: false,
      // msg : "service deleted successfully",
      data: null,
    };

    let service = await this.FindWithId(id);

    if (!service) {
      res.err = true;
      // res.msg = "service not found";
      return res;
    }

    await NotificationModel.deleteOne({ _id: id });

    // UserService.writeAudit(auth,`deleted service ${service.name}`).then().catch();

    return res;
  }

  async getOneService(id: string) {
    let res = {
      err: false,
      // msg : "success",
      data: null,
    };

    let service = await this.FindWithId(id);

    if (!service) {
      res.err = true;
      // res.msg = "service not found";
      return res;
    }

    res.data = service;
    return res;
  }

  async getServices(filter: any) {
    let match: any = {};

    if (filter.summary === "true") return this.getNotificationSummary();

    if (filter.enabled) return await this.FilterNotification(filter);

    if (filter.name) match.name = { $regex: filter.name, $options: "i" };

    if (filter.class) match.notificationClass = filter.class;

    filter = Util.setPaging(filter);

    return await NotificationModel.find(match).read("secondary");
  }

  async getNotificationSummary() {
    let active = 0;
    let inactive = 0;
    let total = 0;

    let services: any = await NotificationModel.find({});

    services.forEach((service) => {
      if (service.enabled) active++;
      else inactive++;
      total++;
    });

    return {
      active,
      inactive,
      total,
    };
  }
  public async FilterNotification(filter: any) {
    const services: any = await NotificationModel.find({});

    if (filter.enabled === "false") {
      return services.filter((service) => !service.enabled);
    } else if (filter.enabled === "true") {
      return services.filter((service) => service.enabled);
    } else {
      return true;
    }
  }
  public async SearchNotifications(search: any) {
    const services: any = await NotificationModel.find({});

    return services.map((service) => {
      if (service.name.toLowerCase().includes(search.toLowerCase())) {
        return service;
      }
    });
  }

  public async BulkUpload(data: any[]) {
    const failed = [];
    const success = [];

    for(const upload of data){
      
    }

  }
}

export default new NotificationService();
