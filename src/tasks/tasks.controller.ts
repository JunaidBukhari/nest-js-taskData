import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Prisma, Task } from '@prisma/client';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async createTask(@Body() data: Prisma.TaskCreateInput): Promise<Task> {
    return this.tasksService.createTask(data);
  }

  @Get(':userId')
  async getTasks(@Param('userId') userId: string): Promise<Task[]> {
    return this.tasksService.getTasks(Number(userId));
  }
}
