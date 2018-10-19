import {Model} from "@mean-expert/model";
import {PrimusClientFn} from "../../server/PrimusClientFn";

/**
 * @module Dashboard
 * @description
 * Write a useful Dashboard Model description.
 * Register hooks and remote methods within the
 * Model Decorator
 **/
@Model({
  hooks: {
    beforeSave: {name: "before save", type: "operation"},
    afterSave: { name: "after save", type: "operation" },
    beforeDelete: {name: "before delete", type: "operation"},
    afterDelete: {name: "after delete", type: "operation"},
  },
  remotes: {
  },
})

class Dashboard {

  private primusClient: any;

  // LoopBack model instance is injected in constructor
  constructor(public model: any) {
    this.primusClient = PrimusClientFn.newClient();
  }

  // Example Operation Hook
  public beforeSave(ctx: any, next: Function): void {
    console.log("Dashboard: Before Save");
    if (ctx.instance) {
      ctx.instance.createdAt = new Date();
    }
    next();
  }

  // Delete dashboard method
  public beforeDelete(ctx: any, next: Function): void {
    // Get the dashboardId from instance
    const dashboardId = ctx.where.id;
    if (dashboardId) {
      this.model.app.models.Widget.destroyAll({dashboardId}, (err: any, result: any) => {  if (err) { console.error(err); } });
    }
    next();
  }

  public afterDelete(ctx: any, next: Function): void {
    let dashboard = ctx.instance;
    if (dashboard) {
      const payload = {
        event: "dashboard",
        content: dashboard,
        action: "DELETE"
      };
      this.primusClient.write(payload);
      next();
    }
  }

  public afterSave(ctx: any, next: Function): void {
    // Pub-sub
    let dashboard = ctx.instance;
    const payload = {
      event: "dashboard",
      content: dashboard,
      action: ctx.isNewInstance ? "CREATE" : "UPDATE"
    };
    this.primusClient.write(payload);
    next();
  }
}

module.exports = Dashboard;
