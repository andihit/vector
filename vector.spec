%global vector_version 2.0.0-beta.1

Name:           vector
Version:        2.0.0
Release:        0.1.beta.1
Summary:        On-host performance monitoring framework

License:        ASL 2.0
URL:            https://github.com/Netflix/vector
Source0:        https://github.com/Netflix/vector/archive/v%{vector_version}/vector-%{vector_version}.tar.gz
Source1:        vector_webpack-%{vector_version}.tar.gz
Source2:        vector_testlibs-%{vector_version}.tar.gz
Source3:        vector-httpd-conf
Source4:        vector-nginx-conf
Source5:        make_webpack.sh

Patch0:         000-RPM-spec-and-webpack.patch

BuildArch:      noarch
BuildRequires:  nodejs

Requires:	httpd-filesystem
Requires:	nginx-filesystem
Suggests:	httpd


%description
Vector is an open source on-host performance monitoring framework which exposes
hand picked high resolution system and application metrics to every engineer’s
browser. Having the right metrics available on-demand and at a high resolution
is key to understand how a system behaves and correctly troubleshoot
performance issues.


%prep
%setup -q -T -D -b 0 -n vector-%{vector_version}
%setup -q -T -D -b 1 -n vector-%{vector_version}
%setup -q -T -D -b 2 -n vector-%{vector_version}


%patch0 -p1


%build
true


%install
install -d %{buildroot}%{_datadir}/%{name}
cp -aT dist %{buildroot}%{_datadir}/%{name}

# webserver configurations
install -D -p -m 0644 %{_sourcedir}/vector-httpd-conf %{buildroot}%{_sysconfdir}/httpd/conf.d/%{name}.conf
install -D -p -m 0644 %{_sourcedir}/vector-nginx-conf %{buildroot}%{_sysconfdir}/nginx/default.d/%{name}.conf


%check
node_modules/jest/bin/jest.js


%files
%dir %{_datadir}/%{name}
%{_datadir}/%{name}

%config(noreplace) %{_sysconfdir}/httpd/conf.d/%{name}.conf
%config(noreplace) %{_sysconfdir}/nginx/default.d/%{name}.conf

%license LICENSE
%doc CHANGELOG.md README.md


%changelog
* Wed May  8 2019 Andreas Gerstmayr <agerstmayr@redhat.com> 2.0.0-0.1.beta.1
- initial Vector package
