//
//  ExampleWKWebViewController.m
//  ExampleApp-iOS
//
//  Created by Marcus Westin on 1/13/14.
//  Copyright (c) 2014 Marcus Westin. All rights reserved.
//

#import "ExampleWKWebViewController.h"
#import "WebViewJavascriptBridge.h"

@interface ExampleWKWebViewController ()

@property WebViewJavascriptBridge* bridge;

@end

@implementation ExampleWKWebViewController

- (void)viewWillAppear:(BOOL)animated {
    if (_bridge) { return; }
    
    WKWebView* webView = [[NSClassFromString(@"WKWebView") alloc] initWithFrame:self.view.bounds];
    webView.navigationDelegate = self;
    [self.view addSubview:webView];
    [WebViewJavascriptBridge enableLogging];
    _bridge = [WebViewJavascriptBridge bridgeForWebView:webView];
    [_bridge setWebViewDelegate:self];
    
    [_bridge registerHandler:@"callNativeHandler" handler:^(id data, WVJBResponseCallback responseCallback) {
        NSLog(@"testObjcCallback called: %@", data);
        responseCallback(@"Response from testObjcCallback");
    }];
    
    [_bridge callHandler:@"testJavascriptHandler" data:@{ @"foo":@"before ready" }];
    
    [self renderButtons:webView];
    [self loadExamplePage:webView];
}

- (void)webView:(WKWebView *)webView didStartProvisionalNavigation:(WKNavigation *)navigation {
    NSLog(@"webViewDidStartLoad");
}

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
    NSLog(@"webViewDidFinishLoad");
}

- (void)renderButtons:(UIWebView*)webView {
    UIFont* font = [UIFont fontWithName:@"HelveticaNeue" size:11.0];
    
    CGFloat btnHeight = 35;
    CGFloat y = self.view.frame.size.height - btnHeight - 48;
    UIButton *callbackButton = [UIButton buttonWithType:UIButtonTypeRoundedRect];
    [callbackButton setTitle:@"Call handler" forState:UIControlStateNormal];
    [callbackButton addTarget:self action:@selector(callHandler:) forControlEvents:UIControlEventTouchUpInside];
    [self.view insertSubview:callbackButton aboveSubview:webView];
    
    callbackButton.frame = CGRectMake(0, y, 100, btnHeight);
    callbackButton.titleLabel.font = font;
    
    UIButton* reloadButton = [UIButton buttonWithType:UIButtonTypeRoundedRect];
    [reloadButton setTitle:@"Reload webview" forState:UIControlStateNormal];
    [reloadButton addTarget:webView action:@selector(reload) forControlEvents:UIControlEventTouchUpInside];
    [self.view insertSubview:reloadButton aboveSubview:webView];
    reloadButton.frame = CGRectMake(90, y, 100, btnHeight);
    reloadButton.titleLabel.font = font;
    
    UIButton* safetyTimeoutButton = [UIButton buttonWithType:UIButtonTypeRoundedRect];
    [safetyTimeoutButton setTitle:@"Disable safety timeout" forState:UIControlStateNormal];
    [safetyTimeoutButton addTarget:self action:@selector(disableSafetyTimeout) forControlEvents:UIControlEventTouchUpInside];
    [self.view insertSubview:safetyTimeoutButton aboveSubview:webView];
    safetyTimeoutButton.frame = CGRectMake(190, y, 120, btnHeight);
    safetyTimeoutButton.titleLabel.font = font;
}

- (void)callHandler:(id)sender {
    id data = @{ @"greetingFromObjC": @"Hi there, JS!" };
    [_bridge callHandler:@"testJavascriptHandler" data:data responseCallback:^(id response) {
        NSLog(@"testJavascriptHandler responded: %@", response);
    }];
}

- (void)loadExamplePage:(WKWebView*)webView {
    NSURLRequest* request =[NSURLRequest requestWithURL:[NSURL URLWithString:@"http://192.168.1.4:8080"]];
    [webView loadRequest:request];
}
@end
