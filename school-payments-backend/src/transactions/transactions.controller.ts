import { Controller, Get, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly txService: TransactionsService) {}

  @Get()
  all() {
    return this.txService.findAllStatuses();
  }

  @Get('school/:schoolId')
  bySchool(@Param('schoolId') schoolId: string) {
    return this.txService.findOrdersBySchool(schoolId);
  }
}

@Controller()
export class TransactionStatusController {
  constructor(private readonly txService: TransactionsService) {}

  @Get('transaction-status/:custom_order_id')
  status(@Param('custom_order_id') customOrderId: string) {
    console.log(customOrderId)
    return this.txService.findStatusByCustomOrderId(customOrderId);
  }
}
