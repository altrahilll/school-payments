import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';

class StudentInfoDto {
  @IsNotEmpty() name!: string;
  @IsNotEmpty() id!: string;
  @IsEmail() email!: string;
}

class CreatePaymentDto {
  @ValidateNested() @Type(() => StudentInfoDto)
  student_info!: StudentInfoDto;

  @IsNumber() @Min(1) amount!: number;

  // allow localhost callback or any valid http/https
  @IsOptional()
  @IsUrl({ require_tld: false, require_protocol: true })
  callback_url?: string;

  @IsOptional() @IsString()
  gateway_name?: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  create(@Body() dto: CreatePaymentDto, @Req() req: any) {
    return this.paymentsService.createPayment(dto, req.user);
  }

  // PUBLIC: Used by frontend “Check PG status”
  @Get('status/:collect_request_id')
  status(@Param('collect_request_id') id: string) {
    return this.paymentsService.checkStatus(id);
  }
}