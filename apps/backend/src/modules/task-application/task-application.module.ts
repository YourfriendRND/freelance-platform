import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TaskModule } from '../task/task.module';
import { TaskApplicationController } from './task-application.controller';
import { TaskApplicationRepository } from './task-application.repository';
import { TaskApplicationService } from './task-application.service';

@Module({
  imports: [AuthModule, TaskModule],
  controllers: [TaskApplicationController],
  providers: [TaskApplicationService, TaskApplicationRepository],
  exports: [TaskApplicationService],
})
export class TaskApplicationModule {}
