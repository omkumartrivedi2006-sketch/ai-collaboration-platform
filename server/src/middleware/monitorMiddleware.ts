import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import os from 'os';

export const monitorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startHrTime = process.hrtime();

  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
    
    const memoryUsage = process.memoryUsage();
    const rssMb = (memoryUsage.rss / 1024 / 1024).toFixed(2);
    
    // CPU load averages
    const cpuLoad = os.loadavg();
    
    const logDetails = {
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      latencyMs: elapsedTimeMs.toFixed(2),
      memoryRssMb: `${rssMb} MB`,
      systemCpuLoad: cpuLoad[0].toFixed(2)
    };

    const message = `${req.method} ${logDetails.path} finished with ${res.statusCode} in ${logDetails.latencyMs}ms`;

    if (res.statusCode >= 500) {
      logger.error(`Failed API Request: ${message}`, undefined, logDetails);
    } else if (res.statusCode >= 400) {
      logger.warn(`Client Request Warning: ${message}`, logDetails);
    } else {
      logger.info(message, logDetails);
    }
  });

  next();
};
