import RegNotificationModel from "../db/model/registerednotification.model";
import Util from "../helpers/utils";

class RegNotification {
  public async create(data: any) {
    return await RegNotificationModel.create(data);
  }

  public async UpdateOne(data: any, opt = null) {
    if (opt) {
      return await RegNotificationModel.updateOne({ _id: data }, opt);
    }

    return await RegNotificationModel.updateOne({ _id: data._id }, data);
  }
  public async FindWithId(id: string) {
    return await RegNotificationModel.findOne({ _id: id });
  }

  public async AddService(data: any) {
    let ser = {
      name: data.name,
      merchantId: data.merchantId || "",
      terminalId: data.terminalId || "",
      identifier: data.identifier || "",
      notificationService: data.notificationService,
      enabled: data.enabled,
      selectors: data.selectors || [],
    };

    // UserService.writeAudit(auth,`added new reg-service ${ser.name}`).then().catch();

    return await this.create(ser);
  }

  public async UpdateService(id: string, data: any) {
    let res = {
      err: false,
      msg: "service updated successfully",
      data: null,
    };

    let service: any = await this.FindWithId(id);

    if (!service) {
      res.err = true;
      res.msg = "service not found";
      return res;
    }

    service.name = data.name;
    service.merchantId = data.merchantId || "";
    service.terminalId = data.terminalId || "";
    service.identifier = data.identifier || "";
    service.notificationService = data.notificationService;
    service.enabled = data.enabled || false;
    service.selectors = data.selectors || [];

    await this.UpdateOne(service);
    res.data = service;

    // UserService.writeAudit(auth,`updated reg-service ${service.name}`).then().catch();

    return res;
  }

  public async DeleteService(id: string) {
    let res = {
      err: false,
      msg: "service deleted successfully",
      data: null,
    };

    let service = await this.FindWithId(id);

    if (!service) {
      res.err = true;
      res.msg = "service not found";
      return res;
    }

    await RegNotificationModel.deleteOne({ _id: id });

    // UserService.writeAudit(auth,`deleted service ${service.name}`).then().catch();

    return res;
  }

  public async getOneService(id: string) {
    let res = {
      err: false,
      msg: "success",
      data: null,
    };

    let service = await this.FindWithId(id);

    if (!service) {
      res.err = true;
      res.msg = "service not found";
      return res;
    }

    res.data = service;
    return res;
  }

  public async getServices(filter: any) {
    let match: any = {};

    if (filter.enabled) return await this.FilterNotification(filter);

    if (filter.name) match.name = { $regex: filter.name, $options: "i" };

    if (filter.service) match.notificationService = filter.service;

    filter = Util.setPaging(filter);

    return await RegNotificationModel.find(match)
      .read("secondary")
      .populate("notificationService");
  }

  public async FilterNotification(filter: any) {
    const services: any = await RegNotificationModel.find({}).populate(
      "notificationService"
    );

    if (filter.enabled === "false") {
      return services.filter((service) => !service.notificationService.enabled);
    } else if (filter.enabled === "true") {
      return services.filter((service) => service.notificationService.enabled);
    } else {
      return true;
    }
  }
  public async SearchNotifications(search: any) {
    const services: any = await RegNotificationModel.find({}).populate(
      "notificationService"
    );

    return services.filter((service) => {
      //url or class
      if (
        service.notificationService.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        service.notificationService.notificationClass
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        service.notificationService.url
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return service;
      }
    })
  }
}

export default new RegNotification();
