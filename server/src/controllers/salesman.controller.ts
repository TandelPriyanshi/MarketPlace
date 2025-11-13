import { Controller, Get, Post, Body, Param, Put, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { SalesmanService } from '../services/salesman.service';
import { CreateVisitDto, UpdateVisitDto, RecordAttendanceDto, PerformanceQueryDto, CreateBeatDto } from '../dto/salesman.dto';

// Extend the Express Request type to include the user property
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    // Add other user properties as needed
  };
}

@ApiTags('salesman')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('salesman')
export class SalesmanController {
  constructor(private readonly salesmanService: SalesmanService) {}

  @Get('beats')
  @ApiOperation({ summary: 'Get all beats for the logged-in salesman' })
  @ApiResponse({ status: 200, description: 'Returns all beats for the salesman' })
  async getBeats(@Req() req: AuthenticatedRequest) {
    return this.salesmanService.getSalesmanBeats(req.user.id);
  }

  @Post('beats')
  @ApiOperation({ summary: 'Create a new beat' })
  @ApiResponse({ status: 201, description: 'Creates a new beat' })
  async createBeat(
    @Req() req: AuthenticatedRequest,
    @Body() createBeatDto: CreateBeatDto
  ) {
    return this.salesmanService.createBeat(req.user.id, createBeatDto);
  }

  @Post('visits')
  @ApiOperation({ summary: 'Log a new store visit' })
  @ApiResponse({ status: 201, description: 'Logs a new store visit' })
  async logVisit(
    @Req() req: AuthenticatedRequest,
    @Body() createVisitDto: CreateVisitDto
  ) {
    return this.salesmanService.logVisit(req.user.id, createVisitDto);
  }

  @Put('visits/:id')
  @ApiOperation({ summary: 'Update a visit' })
  @ApiResponse({ status: 200, description: 'Updates a visit' })
  async updateVisit(
    @Req() req: AuthenticatedRequest,
    @Param('id') visitId: string,
    @Body() updateVisitDto: UpdateVisitDto,
  ) {
    return this.salesmanService.updateVisit(visitId, req.user.id, updateVisitDto);
  }

  @Post('attendance')
  @ApiOperation({ summary: 'Record salesman attendance' })
  @ApiResponse({ status: 201, description: 'Records salesman attendance' })
  async recordAttendance(
    @Req() req: AuthenticatedRequest,
    @Body() attendanceData: RecordAttendanceDto,
  ) {
    return this.salesmanService.recordAttendance(req.user.id, attendanceData);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get salesman performance metrics' })
  @ApiResponse({ status: 200, description: 'Returns performance metrics' })
  async getPerformance(
    @Req() req: AuthenticatedRequest,
    @Query() query: PerformanceQueryDto,
  ) {
    return this.salesmanService.getPerformanceMetrics(req.user.id, query);
  }
}
