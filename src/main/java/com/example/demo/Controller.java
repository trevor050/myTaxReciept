
    package com.example.demo;

    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.RestController;

    @RestController
    public class Controller {

        @GetMapping("/hello")
        public String hello() {
            return "Hello, world!";
        }

        @GetMapping("/goodbye")
        public String goodbye() {
            return "Goodbye, world!";
        }
    }
    