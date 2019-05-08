Name:           vector
Version:        2.0.0
Release:        0.1.beta.1
Summary:        On-host performance monitoring framework which exposes hand picked high resolution metrics to every engineer's browser

License:        ASL 2.0
URL:            https://github.com/Netflix/vector
Source0:        https://github.com/Netflix/vector/archive/v%{version}-beta.1.tar.gz

BuildArch:      noarch
BuildRequires:  npm

%description
Vector is an open source on-host performance monitoring framework which exposes
hand picked high resolution system and application metrics to every engineer’s
browser. Having the right metrics available on-demand and at a high resolution
is key to understand how a system behaves and correctly troubleshoot
performance issues.


%prep
%autosetup -n %{name}-%{version}-beta.1


%build
npm install
npm run build-prod


%install
install -d %{buildroot}%{_datadir}/%{name}
cp -aT dist %{buildroot}%{_datadir}/%{name}


%files
%dir %{_datadir}/%{name}
%{_datadir}/%{name}

%license LICENSE
%doc CHANGELOG.md README.md


%changelog
* Wed May  8 2019 Andreas Gerstmayr <agerstmayr@redhat.com>
- initial Vector package
