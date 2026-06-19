import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Permite que quqluer modulo importe o Prisma Service sem precisar importar o PrismaModule
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
