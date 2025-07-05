package suminjn.nextbill.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import suminjn.nextbill.dto.LoginRequestDto;
import suminjn.nextbill.dto.LoginResponseDto;
import suminjn.nextbill.dto.RefreshTokenRequestDto;
import suminjn.nextbill.dto.UserResponseDto;
import suminjn.nextbill.security.JwtProvider;
import suminjn.nextbill.service.AuthService;
import suminjn.nextbill.service.UserService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtProvider jwtProvider;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        LoginResponseDto tokens = authService.login(request);
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDto> refresh(@Valid @RequestBody RefreshTokenRequestDto request) {
        LoginResponseDto newTokens = authService.refreshToken(request);
        return ResponseEntity.ok(newTokens);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String token = resolveToken(request);
        if (token != null && jwtProvider.validateToken(token)) {
            String email = jwtProvider.getEmailFromToken(token);
            authService.logout(email);
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(HttpServletRequest request) {
        String token = resolveToken(request);
        if (token == null || !jwtProvider.validateToken(token)) {
            return ResponseEntity.status(401).build();
        }
        
        String email = jwtProvider.getEmailFromToken(token);
        UserResponseDto user = userService.getUserResponseByEmail(email);
        return ResponseEntity.ok(user);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        return (bearer != null && bearer.startsWith("Bearer ")) ? bearer.substring(7) : null;
    }
}