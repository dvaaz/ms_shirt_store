import { CreateStatusPagamentoDto } from 'src/status_pagamento/dto/create-status_pagamento.dto';
import { UpdateStatusPagamentoDto } from 'src/status_pagamento/dto/update-status_pagamento.dto';
import {
  Prisma as PrismaClient,
  status_pagamento as StatusPagamentoModel,
} from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma/prisma.service';
