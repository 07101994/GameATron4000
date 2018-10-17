/// <reference path="../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path="../node_modules/rx/ts/rx.d.ts" />

import { Action } from "./action"
import { DirectLine } from "../node_modules/botframework-directlinejs/built/directline";
import { Settings } from "./settings"
import "../node_modules/rxjs/add/operator/concatMap";

declare var GameName: any;

export class BotClient {

    private directLine: DirectLine;
    private conversationId: string;

    constructor() {

        this.directLine = new DirectLine({
            secret: Settings.DIRECT_LINE_SECRET
        });
    }

    public connect(onMessage: Function, onEvent: Function) {

        this.directLine.activity$
            .filter(activity => (activity.type === "message" || activity.type === "event") && activity.from.id === Settings.BOT_ID)
            .concatMap(async x => {

                var activity = <any>x;

                if (!this.conversationId) {
                    this.conversationId = activity.conversation.id;
                    console.log("Connected to 🤖")
                }

                console.log("🤖 " + this.activityToString(activity));
                
                if (activity.type == "message")
                {
                    if (activity.text == "Which game do you want to play?") {
                        this.sendMessageToBot(GameName);
                    } else {
                        await onMessage(activity);
                    }
                }
                else if (activity.type == "event")
                {
                    await onEvent(activity);
                }
            })
            .subscribe();
    }

    public async sendActionToBot(action: Action) {

        var text = action.getDisplayText();

        await this.sendMessageToBot(text);
    }

    public async sendMessageToBot(text: string) {
        
        console.log("👩‍💻 " + text);

        this.directLine.postActivity({
            from: { id: this.conversationId },
            type: "message",
            text: text
        })        
        .subscribe();
    }

    private activityToString(activity: any) {

        var result = activity.type;
        var properties = [];

        if (activity.name) {
            properties.push({ name: 'name', value: activity.name })
        }

        if (activity.actorId) {
            properties.push({ name: 'actorId', value: activity.actorId })
        }

        if (activity.closeUpId) {
            properties.push({ name: 'closeUpId', value: activity.closeUpId })
        }

        if (activity.inventoryItemId) {
            properties.push({ name: 'inventoryItemId', value: activity.inventoryItemId })
        }

        if (activity.objectId) {
            properties.push({ name: 'objectId', value: activity.objectId })
        }

        if (activity.text) {
            properties.push({ name: 'text', value: activity.text })
        }

        if (activity.description) {
            properties.push({ name: 'description', value: activity.description })
        }

        if (activity.roomId) {
            properties.push({ name: 'roomId', value: activity.roomId })
        }

        if (activity.x) {
            properties.push({ name: 'x', value: activity.x })
        }

        if (activity.y) {
            properties.push({ name: 'y', value: activity.y })
        }

        if (properties.length > 0) {
            return result + ' (' + properties.map((p : any) => p.name + '=' + p.value).join(', ') + ')';
        }

        return result;
    }
}