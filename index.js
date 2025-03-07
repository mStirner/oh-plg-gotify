const { events } = require("../../system/notifications");
const request = require("../../helper/request.js");

module.exports = (info, logger, init) => {
    return init([
        "devices",
        "store",
        "vault"
    ], async (scope, [
        C_DEVICES,
        C_STORE,
        C_VAULT
    ]) => {


        let device = await new Promise((resovle) => {
            C_DEVICES.found({
                labels: [
                    "gotify=true"
                ],
            }, (device) => {

                logger.debug(`Gotify server device found`, device);
                resovle(device);

            }, async (filter) => {

                // add device
                C_DEVICES.add({
                    name: "Gotify Server",
                    icon: "fa-solid fa-envelope",
                    interfaces: [{
                        settings: {
                            host: "127.5.5.1",
                            port: 80
                        }
                    }],
                    ...filter
                });

            });
        });


        let vault = await new Promise((resolve) => {
            C_VAULT.found({
                labels: [
                    `device=${device._id}`,
                    "gotify=true"
                ]
            }, (vault) => {

                logger.debug(`Gotify vault found`, vault);
                resolve(vault);

            }, (filter) => {

                C_VAULT.add({
                    name: "Gotify Server",
                    identifier: device._id,
                    secrets: [{
                        name: "Token",
                        description: "App Token to be used as Authentication/App selection",
                        key: "token"
                    }],
                    ...filter
                });

            });
        });


        Promise.all([device, vault]).then(() => {

            let iface = device.interfaces[0];
            let { host, port } = iface.settings;
            let agent = iface.httpAgent();
            let secret = vault.secrets[0];

            events.on("publish", ({ title, message, type }) => {
                try {

                    logger.verbose("Event received", {
                        title,
                        message,
                        type
                    });

                    request(`http://${host}:${port}/message?token=${secret.decrypt()}`, {
                        agent,
                        method: "POST",
                        headers: {
                            "content-type": "application/json"
                        },
                        body: JSON.stringify({
                            title,
                            message,
                            priority: 5
                        })
                    }, (err, result) => {
                        if (err || result?.body?.error) {

                            // feedback
                            logger.warn(err || result?.body?.error, "HTTP request failed");

                        } else {

                            let { id, date, priority } = result.body;

                            // feedback
                            logger.info(`Notification #${id} placed, date "${date}" as priority "${priority}"`);

                        }
                    });

                } catch (err) {

                    // feedacbk
                    logger.error(err, "Could not send notification");

                }
            });

        }).catch((err) => {

            // feedback
            logger.error(err, "Could not setup plugin");

        });


    });
};