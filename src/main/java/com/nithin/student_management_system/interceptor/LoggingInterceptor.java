package com.nithin.student_management_system.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

@Component
public class LoggingInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) {

        System.out.println("========== INTERCEPTOR ==========");
        System.out.println("1. preHandle() - Before Controller");
        System.out.println("Method: " + request.getMethod());
        System.out.println("URI: " + request.getRequestURI());

        return true;
    }

    @Override
    public void postHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            ModelAndView modelAndView) {

        System.out.println("2. postHandle() - After Controller");
    }

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception ex) {

        System.out.println("3. afterCompletion() - Request Fully Completed");
        System.out.println("=================================");
    }
}
