import { Component, Input, OnInit } from '@angular/core';
import { EMPTY, firstValueFrom, map, Observable } from 'rxjs';
import { PubsubService, ReceivedMessage, Subscription } from 'src/app/services/pubsub.service';

@Component({
  selector: 'app-subscription-details',
  templateUrl: './subscription-details.component.html',
  styleUrls: ['./subscription-details.component.scss']
})
export class SubscriptionDetailsComponent implements OnInit {

  @Input() subscriptionPath?: string

  details: Observable<Subscription> = EMPTY
  messages: ReceivedMessage[] = []

  constructor(private pubsub: PubsubService) { }

  ngOnInit(): void {
    this.details = this.pubsub.getSubscriptionDetails(this.subscriptionPath!)
  }

  pullMessages(): void {
    console.log('trying to pull messages')

    this.pubsub.fetchMessages(this.subscriptionPath!, 20)
      .pipe(map(results => results.map(msg => {
        msg.message.data = JSON.stringify(JSON.parse(this.convertMessageData(msg.message.data)), undefined, 2)
        return msg
      })))
      .subscribe(results => {
        this.messages = results
      })
  }

  convertMessageData(b64data: string) {
    console.log('doing translation on ', b64data)
    const result = atob(b64data)
    console.log(b64data, " -> ", result)
    return result
  }

  printSomething(data: any) {
    console.log('called with', data)
  }

  async ackMessage(ackId: string){
    const result = await firstValueFrom(this.pubsub.ackMessage(this.subscriptionPath!, [ackId]))
    console.log("result", result)
    
    if(Object.keys(result).length == 0){  // a valid response will be no content
      this.messages = this.messages.filter(msg => msg.ackId != ackId)
    }
  }

}
