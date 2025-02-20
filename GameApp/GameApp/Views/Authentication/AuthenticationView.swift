import SwiftUI

struct AuthenticationView: View {
    @State private var isShowingLogin = true
    
    var body: some View {
        NavigationView {
            VStack {
                Picker("Authentication", selection: $isShowingLogin) {
                    Text("Login").tag(true)
                    Text("Register").tag(false)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                if isShowingLogin {
                    LoginView()
                } else {
                    RegisterView()
                }
                
                Spacer()
            }
            .navigationTitle("Welcome")
        }
    }
}

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var email = ""
    @State private var password = ""
    
    var body: some View {
        VStack(spacing: 20) {
            TextField("Email", text: $email)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .autocapitalization(.none)
                .keyboardType(.emailAddress)
                .disabled(authViewModel.isLoading)
            
            SecureField("Password", text: $password)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .disabled(authViewModel.isLoading)
            
            if authViewModel.isLoading {
                ProgressView()
            } else {
                Button(action: login) {
                    Text("Login")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
            }
            
            if let error = authViewModel.error {
                Text(error)
                    .foregroundColor(.red)
                    .font(.caption)
            }
        }
        .padding()
    }
    
    private func login() {
        Task {
            do {
                try await authViewModel.signIn(email: email, password: password)
            } catch {
                // Error is already handled in the ViewModel
                print("Login error: \(error)")
            }
        }
    }
}

struct RegisterView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var email = ""
    @State private var username = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    
    var body: some View {
        VStack(spacing: 20) {
            TextField("Email", text: $email)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .autocapitalization(.none)
                .keyboardType(.emailAddress)
                .disabled(authViewModel.isLoading)
            
            TextField("Username", text: $username)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .autocapitalization(.none)
                .disabled(authViewModel.isLoading)
            
            SecureField("Password", text: $password)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .disabled(authViewModel.isLoading)
            
            SecureField("Confirm Password", text: $confirmPassword)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .disabled(authViewModel.isLoading)
            
            if authViewModel.isLoading {
                ProgressView()
            } else {
                Button(action: register) {
                    Text("Register")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
                .disabled(!isValidForm)
            }
            
            if let error = authViewModel.error {
                Text(error)
                    .foregroundColor(.red)
                    .font(.caption)
            }
        }
        .padding()
    }
    
    private var isValidForm: Bool {
        !email.isEmpty &&
        !password.isEmpty &&
        password == confirmPassword &&
        password.count >= 6
    }
    
    private func register() {
        Task {
            do {
                try await authViewModel.register(email: email, password: password, username: username)
            } catch {
                // Error is already handled in the ViewModel
                print("Registration error: \(error)")
            }
        }
    }
}

struct AuthenticationView_Previews: PreviewProvider {
    static var previews: some View {
        AuthenticationView()
            .environmentObject(AuthViewModel())
    }
} 