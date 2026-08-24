package com.nithin.student_management_system.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class LoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request,
                         ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest httpRequest =
                (HttpServletRequest) request;
        long startTime = System.currentTimeMillis();
        System.out.println("========== REQUEST START ==========");
        System.out.println("Method: " + httpRequest.getMethod());
        System.out.println("URI: " + httpRequest.getRequestURI());

        chain.doFilter(request, response);
        long endTime = System.currentTimeMillis();
        long timeTaken = endTime - startTime;
        System.out.println("Time Taken: " + timeTaken + " ms");
        System.out.println("========== REQUEST END ==========");
    }
}
