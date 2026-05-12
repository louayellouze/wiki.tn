package api.tn.wiki.config;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

@Aspect
@Component
public class PerformanceAspect {

    private static final Logger logger = LoggerFactory.getLogger(PerformanceAspect.class);

    /**
     * Mesure le temps d'exécution de toutes les méthodes des repositories.
     * Cela permet de voir le temps passé en base de données sans afficher le SQL.
     */
    @Around("execution(* api.tn.wiki.repository.*.*(..))")
    public Object logRepositoryExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        
        Object result = joinPoint.proceed();
        
        stopWatch.stop();
        logger.info("DB Execution: {} -> {} ms", 
                joinPoint.getSignature().getName(), 
                stopWatch.getTotalTimeMillis());
        
        return result;
    }

    /**
     * Mesure le temps d'exécution des services si > 10ms.
     */
    @Around("execution(* api.tn.wiki.service.*.*(..))")
    public Object logServiceExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        
        Object result = joinPoint.proceed();
        
        stopWatch.stop();
        long time = stopWatch.getTotalTimeMillis();
        
        // On logue les services pour avoir une vue d'ensemble du temps de réponse
        if (time > 10) {
            logger.info("Service Execution: {} -> {} ms", 
                    joinPoint.getSignature().getName(), 
                    time);
        }
        
        return result;
    }
}
