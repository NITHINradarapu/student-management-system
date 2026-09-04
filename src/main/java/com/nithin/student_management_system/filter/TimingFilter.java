package com.nithin.student_management_system.filter;

import jakarta.servlet.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(2)
public class TimingFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(TimingFilter.class);

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain)
            throws IOException, ServletException {

        long start = System.currentTimeMillis();
        log.info("TimingFilter - Before");

        chain.doFilter(request, response);

        long elapsed = System.currentTimeMillis() - start;
        log.info("TimingFilter - After | Request took {} ms", elapsed);
    }
}
