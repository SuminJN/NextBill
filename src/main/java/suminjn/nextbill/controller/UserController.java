package suminjn.nextbill.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import suminjn.nextbill.dto.UserRequestDto;
import suminjn.nextbill.dto.UserResponseDto;
import suminjn.nextbill.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserResponseDto> registerUser(@Valid @RequestBody UserRequestDto request) {
        UserResponseDto response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/exists")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        return ResponseEntity.ok(userService.existsByEmail(email));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable Long userId, 
            @Valid @RequestBody UserRequestDto request) {
        UserResponseDto response = userService.updateUser(userId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{userId}/email-alert")
    public ResponseEntity<UserResponseDto> updateEmailAlertSetting(
            @PathVariable Long userId, 
            @RequestParam Boolean isEmailAlertEnabled) {
        UserResponseDto response = userService.updateEmailAlertSetting(userId, isEmailAlertEnabled);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}